import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const DUMMY_SURVEYS = [
  { id: "SRV-101", name: "Customer Feedback Q3", responses: 142, status: "Active", date: "2024-09-01" },
  { id: "SRV-102", name: "Product Satisfaction", responses: 89, status: "Draft", date: "2024-09-15" },
  { id: "SRV-103", name: "Employee Engagement", responses: 256, status: "Closed", date: "2024-08-20" },
  { id: "SRV-104", name: "Beta Tester Survey", responses: 45, status: "Active", date: "2024-10-02" },
];

export default function SurveysPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-light text-white tracking-tight">Surveys</h1>
        <p className="text-slate-400 mt-2">Manage and view your generated surveys and responses.</p>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Survey ID</th>
                <th scope="col" className="px-6 py-4 font-medium">Name</th>
                <th scope="col" className="px-6 py-4 font-medium">Date Created</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Responses</th>
                <th scope="col" className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {DUMMY_SURVEYS.map((survey) => (
                <tr key={survey.id} className="hover:bg-white/5 transition-colors text-slate-300">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-300">{survey.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{survey.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{survey.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{survey.responses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      survey.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      survey.status === 'Closed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {survey.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
