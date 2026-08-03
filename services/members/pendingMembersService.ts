export type PendingMember = {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  approval_status: "pending";
};

type ApiResponse<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
};

type AdminCredentials = {
  adminPhone: string;
  adminPin: string;
};

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "הפעולה נכשלה");
  }

  return data;
}

export async function getPendingMembers(
  credentials: AdminCredentials
): Promise<PendingMember[]> {
  const response = await fetch("/api/members/pending", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = await readResponse<PendingMember[]>(response);

  return result.data ?? [];
}

export async function approvePendingMember(params: {
  memberId: string;
  role: "player" | "captain" | "admin";
  adminPhone: string;
  adminPin: string;
}) {
  const response = await fetch("/api/members/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return readResponse(response);
}

export async function rejectPendingMember(params: {
  memberId: string;
  adminPhone: string;
  adminPin: string;
}) {
  const response = await fetch("/api/members/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return readResponse(response);
}