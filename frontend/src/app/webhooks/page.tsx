"use client";

import {
    useEffect,
    useState,
} from "react";

import ProjectHeader
    from "@/components/projects/ProjectHeader";

import WebhookForm
    from "@/components/webhooks/WebhookForm";

import WebhookTable
    from "@/components/webhooks/WebhookTable";

import {
    createWebhook,
    deleteWebhook,
    getWebhooks,
} from "@/lib/webhooks-api";
import toast from "react-hot-toast";
import { useRequireProject } from "@/lib/useRequireProject";

export default function WebhooksPage() {
    useRequireProject();
    const [
        webhooks,
        setWebhooks,
    ] = useState([]);

    async function load() {
        const data =
            await getWebhooks();

        setWebhooks(
            data,
        );
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(
        url: string,
    ) {
        try {
            await createWebhook(
                url,
            );

            toast.success(
                "Webhook added successfully",
            );

            await load();
        } catch {
            toast.error(
                "Failed to add webhook",
            );
        }
    }

    async function handleDelete(
        id: string,
    ) {
        try {
            await deleteWebhook(
                id,
            );

            toast.success(
                "Webhook deleted",
            );

            await load();
        } catch {
            toast.error(
                "Failed to delete webhook",
            );
        }
    }

    return (
        <div
            className="
                max-w-7xl
                mx-auto
                p-8
            "
        >
            <ProjectHeader
                projectName="Project 5"
                status="Healthy"
                subtitle="
                    Configure webhook integrations
                "
            />

            <WebhookForm
                onCreate={
                    handleCreate
                }
            />

            <div
                className="
                    mt-8
                "
            >
                <WebhookTable
                    webhooks={
                        webhooks
                    }
                    onDelete={
                        handleDelete
                    }
                />
            </div>
        </div>
    );
}