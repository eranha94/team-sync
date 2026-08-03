import { AlertCircle } from "lucide-react";

type DashboardAlertProps = {
  message?: string | null;
};

export default function DashboardAlert({
  message,
}: DashboardAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    >
      <AlertCircle
        size={19}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}