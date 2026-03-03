import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Log stream is not wired yet. This route exists to keep admin navigation stable.
        </p>
      </div>
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">No logs available</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Connect your logging source to render runtime/admin events here.
        </CardContent>
      </Card>
    </div>
  );
}
