"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SandboxService } from "./services/sandbox";
import { coopApi } from "./api/coop";
import { type ApiExchange, type Cooperative, type LogEntry } from "./types";
import { EnrollRequest } from "./api/types";

interface ServiceResponse {
  data: any;
  body: any;
}

const mapBackendToCoop = (item: any): Cooperative => {
  return {
    id: String(item.id),
    name: item.name || item.cooperative_name || "Unknown",
    email: item.email || item.cooperative_email || "",
    regNo: item.account_number || item.registration_number || "",
    status: item.status || "enrolled",
    walletAddress: item.rafiki?.wallet_address_url || item.wallet_url || null,
    balanceUnits: item.balance_units || 0,
    pan: item.pan_number || "",
    enrolledAt: item.created_at || new Date().toISOString(),
    authority: item.registration_authority || "Other",
  };
};

interface SandboxContextValue {
  coops: Cooperative[];
  logs: LogEntry[];
  exchanges: ApiExchange[];
  selectedCoopId: string | null;
  setSelectedCoopId: (id: string | null) => void;
  isConnected: boolean;
  enroll: (input: EnrollRequest) => Promise<Cooperative>;
  createWallet: (
    id: string,
    reg: string,
    email: string,
    name: string,
  ) => Promise<Cooperative>;
  transfer: (
    s: string,
    r: string,
    a: number,
    d: string,
    step: (s: number) => void,
  ) => Promise<any>;
  deposit: (id: string, a: number) => Promise<void>;
  refreshBalance: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  clearLogs: () => void;
  lookup: (n: string, r: string) => Promise<Cooperative>;
  showDevPanel: boolean;
  setShowDevPanel: (show: boolean) => void;
}

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [coops, setCoops] = useState<Cooperative[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [exchanges, setExchanges] = useState<ApiExchange[]>([]);
  const [selectedCoopId, setInternalSelectedId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(true); 

  const addLog = useCallback(
    (
      from: any,
      to: any,
      message: string,
      level: LogEntry["level"] = "info",
    ) => {
      setLogs((p) => [
        ...p,
        {
          id: Math.random().toString(36).slice(2, 9),
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          from,
          to,
          message,
          level,
        },
      ]);
    },
    [],
  );

  const addRecord = useCallback(
    (method: any, endpoint: string, req: any, res: any, status: number) => {
      setExchanges((p) => [
        {
          id: Math.random().toString(36).slice(2, 9),
          method,
          endpoint,
          request: req,
          response: res,
          status,
          at: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        },
        ...p,
      ]);
    },
    [],
  );

  const refreshBalance = useCallback(
    async (coopId: string) => {
      if (!coopId) return;
      addLog("Entry Point", "Middleware", `GET /balance_inquiry/${coopId}`);

      try {
        const data = (await coopApi.balance(coopId)) as any;
        addRecord("GET", `/balance_inquiry/${coopId}`, null, data, 200);

        // Handle both {balance: "100.00"} and {data: {balance: "100.00"}}
        const rawBalance = data.balance || data.data?.balance || "0.00";
        const units = Math.round(parseFloat(rawBalance) * 100);

        setCoops((prev) =>
          prev.map((c) =>
            String(c.id) === String(coopId) ? { ...c, balanceUnits: units } : c,
          ),
        );
        addLog(
          "Middleware",
          "Entry Point",
          `Balance synced: ₨ ${rawBalance}`,
          "success",
        );
      } catch (err: any) {
        addLog(
          "Middleware",
          "Entry Point",
          `Sync failed: ${err.message}`,
          "error",
        );
      }
    },
    [addLog, addRecord],
  );

  const setSelectedCoopId = useCallback(
    (id: string | null) => {
      setInternalSelectedId(id);
      if (id) {
        // Small delay to ensure state transition is smooth
        setTimeout(() => refreshBalance(id), 100);
      }
    },
    [refreshBalance],
  );

  const refreshAll = useCallback(async () => {
    try {
      const response = (await coopApi.list()) as any;
      const data = response.data || response;
      const mapped = (Array.isArray(data) ? data : []).map(mapBackendToCoop);
      setCoops(mapped);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 100000000); // 15 seconds heartbeat
    return () => clearInterval(interval);
  }, [refreshAll]);

  const lookup = useCallback(async (name: string, regNo: string) => {
    const res = (await coopApi.lookup(name, regNo)) as any;
    return mapBackendToCoop(res.data || res);
  }, []);

  const enroll = useCallback(
    async (input: EnrollRequest) => {
      addLog("Entry Point", "Middleware", `POST /enroll → ${input.name}`);
      const { data, body } = (await SandboxService.enroll(
        input,
      )) as ServiceResponse;
      addRecord("POST", "/cooperative/enroll", body, data, 200);
      const newCoop = mapBackendToCoop(data.data || data);
      setCoops((prev) => [...prev, newCoop]);
      return newCoop;
    },
    [addLog, addRecord],
  );

  const createWallet = useCallback(
    async (coopId: string, regNo: string, email: string, name: string) => {
      addLog("Entry Point", "Middleware", `POST /wallet/create → ${coopId}`);
      try {
        const { data, body } = (await SandboxService.createWallet(
          coopId,
          regNo,
          email,
        )) as ServiceResponse;
        addRecord("POST", "/wallet/create", body, data, 200);
        const updated = await lookup(name, regNo);
        setCoops((prev) =>
          prev.map((c) => (String(c.id) === String(coopId) ? updated : c)),
        );
        return updated;
      } catch (err: any) {
        addLog("Middleware", "Entry Point", err.message, "error");
        throw err;
      }
    },
    [addLog, addRecord, lookup],
  );

  const transfer = useCallback(
    async (
      sender: string,
      receiver: string,
      amount: number,
      desc: string,
      onStep: (s: number) => void,
    ) => {
      addLog("Entry Point", "Middleware", `POST /transfer → ₨ ${amount}`);
      try {
        onStep(0);
        const { data, body } = (await SandboxService.transfer(
          sender,
          receiver,
          amount,
          desc,
        )) as ServiceResponse;
        addRecord("POST", "/payment/transfer", body, data, 200);
        onStep(1);
        onStep(2);
        onStep(3);
        await refreshBalance(sender);
        await refreshBalance(receiver);
        onStep(4);
        return {
          ok: true,
          rafikiPaymentId:
            data.rafiki_payment_id || data.data?.rafiki_payment_id,
        };
      } catch (err: any) {
        addLog("Middleware", "Entry Point", err.message, "error");
        return { ok: false, error: err.message };
      }
    },
    [addLog, addRecord, refreshBalance],
  );

  const deposit = useCallback(
    async (coopId: string, amount: number) => {
      const coop = coops.find((c) => String(c.id) === String(coopId));
      if (!coop) throw new Error("Coop not found");
      addLog("Entry Point", "Middleware", `POST /load → ₨ ${amount}`);
      const { data, body } = (await SandboxService.deposit(
        coopId,
        coop.regNo,
        amount,
      )) as ServiceResponse;
      addRecord("POST", "/wallet/load", body, data, 200);
      await refreshBalance(coopId);
    },
    [addLog, addRecord, coops, refreshBalance],
  );

  const value = useMemo(
    () => ({
      coops,
      logs,
      exchanges,
      selectedCoopId,
      setSelectedCoopId,
      isConnected,
      enroll,
      createWallet,
      transfer,
      deposit,
      refreshBalance,
      refreshAll,
      lookup,
      showDevPanel,
      setShowDevPanel,
      clearLogs: () => {
        setLogs([]);
        setExchanges([]);
      },
    }),
    [
      coops,
      logs,
      exchanges,
      selectedCoopId,
      isConnected,
      enroll,
      createWallet,
      transfer,
      deposit,
      refreshBalance,
      refreshAll,
      lookup,
      setSelectedCoopId,
      showDevPanel
    ],
  );

  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}

export const useSandbox = () => {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandbox must be used within SandboxProvider");
  return ctx;
};
