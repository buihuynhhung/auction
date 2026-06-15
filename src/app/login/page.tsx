import Link from "next/link";
import { LogIn } from "lucide-react";
import { AlertBox, Button } from "@/components/ui";
import { AuthField, AuthHeading, AuthLayout } from "@/components/auth-layout";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "Email hoặc mật khẩu không đúng.",
  forbidden: "Tài khoản này không có quyền vào khu vực quản trị.",
};

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = params.error ? errorMessages[params.error] : null;
  const next = safeNextPath(params.next);

  return (
    <AuthLayout
      eyebrow="Đăng nhập"
      title="Trở lại phiên đấu giá của bạn"
      description="Đăng nhập để đặt giá, theo dõi lịch sử tham gia và quản lý sản phẩm nếu tài khoản đã được quản trị viên cấp quyền đăng bán."
    >
      <AuthHeading
        label="Tài khoản"
        title="Đăng nhập"
        description="Dùng email và mật khẩu đã đăng ký để truy cập tài khoản."
      />

      {error ? (
        <div className="mb-4">
          <AlertBox tone="danger">{error}</AlertBox>
        </div>
      ) : null}

      <form action="/api/auth/login" method="post" className="space-y-4">
        <input type="hidden" name="next" value={next} />
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
          placeholder="Nhập mật khẩu"
          helper="Mật khẩu phân biệt chữ hoa, chữ thường."
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full">
          <LogIn className="h-4 w-4" />
          Đăng nhập
        </Button>
      </form>

      <div className="mt-5 rounded-md border border-border bg-surface-muted px-4 py-3 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-semibold text-primary"
        >
          Đăng ký ngay
        </Link>
      </div>
    </AuthLayout>
  );
}
