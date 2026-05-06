import { Card } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Surveys | Sales Ai",
  description: "Manage and view survey statistics across all users.",
};

interface UserStat {
  user_id: string;
  user_name: string;
  submission_count: number;
  last_score: number;
  average_score: number;
  last_submission_time: string;
  error: string | null;
}

interface StatsResponse {
  success: boolean;
  total_users: number;
  users: UserStat[];
  error: string | null;
}

async function getStats(): Promise<UserStat[]> {
  try {
    const res = await fetch(
      "https://staging-chatbot-api.pmxbd.com/audio/stats/all",
      {
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return [];
    }
    const data: StatsResponse = await res.json();
    return data.users || [];
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return [];
  }
}

export default async function SurveysPage() {
  const users = await getStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-light text-slate-900 tracking-tight">
          Survey Results
        </h1>
        <p className="text-slate-500 mt-2">
          Manage and view survey statistics across all users.
        </p>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium text-center">
                  SL
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  User Name
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-center">
                  Submissions
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-center">
                  Last Score
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-center">
                  Avg Score
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-right">
                  Last Submission Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, index) => {
                const dateObj = new Date(user.last_submission_time);
                const formattedDate = isNaN(dateObj.getTime())
                  ? "N/A"
                  : new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(dateObj);

                return (
                  <tr
                    key={user.user_id}
                    className="hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                      {user.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-indigo-600 font-medium">
                      {user.submission_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.last_score >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : user.last_score >= 50
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {user.last_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700">
                      {user.average_score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No survey data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
