import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-light tracking-tight text-white">
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-slate-400">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
