import Link from "next/link";
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
                                <Link
                                    href={`/endpoints/${encodeURIComponent(endpoint.endpoint)}`}
                                    className="font-medium text-blue-400 hover:text-blue-300 underline"
                                >
                                    {
                                        endpoint.endpoint
                                    }
                                </Link>

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