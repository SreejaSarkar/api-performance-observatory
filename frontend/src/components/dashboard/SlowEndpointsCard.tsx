import Link from "next/link";
import { Eye, Info } from "lucide-react";
import EmptyState from "../common/EmptyState";

interface Props {
    endpoints: {
        endpoint: string;
        avgLatency: number;
        requests: number;
    }[];
}

export default function SlowEndpointsCard({
    endpoints,
}: Props) {

    if (!endpoints.length) {
        return (
            <EmptyState
                icon="⚡"
                title="No Slow Endpoints"
                description="
                All endpoints are performing
                within acceptable latency limits.
                "
            />
        );
    }

    return (
        <div
            className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
      "
        >
            <h2
                className="
          text-xl
          font-semibold
          mb-4
        "
            >
                Top Slow Endpoints
            </h2>

            <div
                className="
          space-y-4
        "
            >
                {endpoints.map(
                    (endpoint) => (
                        <div
                            key={
                                endpoint.endpoint
                            }
                            className="
                flex
                justify-between
                items-center
              "
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/endpoints/${encodeURIComponent(endpoint.endpoint)}`}
                                        className="font-medium text-blue-400 hover:text-blue-300 underline"
                                    >
                                        {
                                            endpoint.endpoint
                                        }
                                    </Link>

                                    <Link
                                        href={`/endpoints/${encodeURIComponent(endpoint.endpoint)}`}
                                        className="inline-flex items-center justify-center rounded-md border border-slate-700 p-1 text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
                                        title="View endpoint details"
                                        aria-label={`View details for ${endpoint.endpoint}`}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Link>

                                    <span
                                        className="inline-flex items-center text-slate-500 hover:text-slate-300"
                                        title="Opens a detail page with latency trends, errors, methods, environments, and recent request samples for this endpoint."
                                        aria-label="Endpoint details info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </span>
                                </div>

                                <p
                                    className="
                    text-slate-400
                    text-sm
                  "
                                >
                                    {
                                        endpoint.requests
                                    }{" "}
                                    requests
                                </p>
                            </div>

                            <span
                                className="
                  text-red-400
                  font-bold
                "
                            >
                                {
                                    endpoint.avgLatency
                                }
                                ms
                            </span>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}