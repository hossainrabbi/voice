import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-sm text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-light tracking-tight text-slate-900">
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-slate-500">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
