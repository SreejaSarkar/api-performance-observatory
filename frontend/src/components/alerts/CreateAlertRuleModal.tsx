"use client";

import { buttonStyles } from "../ui/ButtonStyles";

interface Props {
    ruleName: string;
    setRuleName: (
        value: string,
    ) => void;

    metric: string;
    setMetric: (
        value: string,
    ) => void;

    threshold: number;
    setThreshold: (
        value: number,
    ) => void;

    severity: string;
    setSeverity: (
        value: string,
    ) => void;

    onCreate: () => void;
    onClose: () => void;
    isEditing: boolean;
}

export default function CreateAlertRuleModal({
    ruleName,
    setRuleName,
    metric,
    setMetric,
    threshold,
    setThreshold,
    severity,
    setSeverity,
    onCreate,
    onClose,
    isEditing
}: Props) {
    return (
        <div
            className="
                fixed
                inset-0
                bg-black/50
                flex
                items-center
                justify-center
                z-50
            "
        >
            <div
                className="
                    bg-slate-900
                    rounded-2xl
                    border
                    border-slate-700
                    w-full
                    max-w-lg
                    p-6
                    shadow-xl
                "
            >
                <h2 className="text-xl font-bold">
                    {isEditing
                        ? "Edit Alert Rule"
                        : "Create Alert Rule"}
                </h2>

                <div className="space-y-5">

                    {/* Rule Name */}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                text-slate-300
                            "
                        >
                            Rule Name
                        </label>

                        <input
                            value={ruleName}
                            onChange={(e) =>
                                setRuleName(
                                    e.target.value,
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-2
                                outline-none
                                focus:border-blue-500
                            "
                            placeholder="High Latency"
                        />
                    </div>

                    {/* Metric */}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                text-slate-300
                            "
                        >
                            Metric
                        </label>

                        <select
                            value={metric}
                            onChange={(e) =>
                                setMetric(
                                    e.target.value,
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-2
                            "
                        >
                            <option value="LATENCY">
                                LATENCY
                            </option>

                            <option value="ERROR_RATE">
                                ERROR_RATE
                            </option>

                            <option value="HEALTH_SCORE">
                                HEALTH_SCORE
                            </option>
                        </select>
                    </div>

                    {/* Threshold */}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                text-slate-300
                            "
                        >
                            Threshold
                        </label>

                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) =>
                                setThreshold(
                                    Number(
                                        e.target
                                            .value,
                                    ),
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-2
                            "
                        />
                    </div>

                    {/* Severity */}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                text-slate-300
                            "
                        >
                            Severity
                        </label>

                        <select
                            value={severity}
                            onChange={(e) =>
                                setSeverity(
                                    e.target.value,
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-800
                                px-4
                                py-2
                            "
                        >
                            <option value="LOW">
                                LOW
                            </option>

                            <option value="MEDIUM">
                                MEDIUM
                            </option>

                            <option value="HIGH">
                                HIGH
                            </option>

                            <option value="CRITICAL">
                                CRITICAL
                            </option>
                        </select>
                    </div>

                </div>

                <div
                    className="
                        flex
                        justify-end
                        gap-3
                        mt-8
                    "
                >
                    <button
                        onClick={onClose}
                        className="
                            px-4
                            py-2
                            rounded-lg
                            border
                            border-slate-600
                            hover:bg-slate-800
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onCreate}
                        className={
                            buttonStyles.primary
                        }
                    >
                        {isEditing
                            ? "Update Rule"
                            : "Create Rule"}
                    </button>
                </div>
            </div>
        </div>
    );
}