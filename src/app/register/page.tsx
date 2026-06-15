import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AlertBox, Button } from "@/components/ui";
import { AuthField, AuthHeading, AuthLayout } from "@/components/auth-layout";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "Vui lòng nhập tên, email và mật khẩu tối thiểu 8 ký tự.",
  exists: "Email này đã được đăng ký.",
};

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const error = params.error ? errorMessages[params.error] : null;
  const next = safeNextPath(params.next);

  return (
    <AuthLayout
      eyebrow="Tạo tài khoản"
      title="Bắt đầu tham gia sàn đấu giá"
      description="Tạo tài khoản để đặt giá, theo dõi các phiên đang quan tâm và nhận quyền đăng bán khi được quản trị viên cấp."
    >
      <AuthHeading
        label="Đăng ký"
        title="Tạo tài khoản"
        description="Bạn chỉ cần tên hiển thị, email và mật khẩu để bắt đầu tham gia đấu giá."
      />

      {error ? (
        <div className="mb-4">
          <AlertBox tone="danger">{error}</AlertBox>
        </div>
      ) : null}

      <form action="/api/auth/register" method="post" className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <AuthField
          label="Tên hiển thị"
          name="name"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthField
          label="Mật khẩu"
          name="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          helper="Dùng mật khẩu đủ dài để bảo vệ tài khoản."
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full">
          <UserPlus className="h-4 w-4" />
          Tạo tài khoản
        </Button>
      </form>

      <div className="mt-5 rounded-md border border-border bg-surface-muted px-4 py-3 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-primary"
        >
          Đăng nhập
        </Link>
      </div>
    </AuthLayout>
  );
}
