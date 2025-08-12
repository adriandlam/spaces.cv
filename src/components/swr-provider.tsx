"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/utils";

export function SWRProvider({ children }: { children: React.ReactNode }) {
	return (
		<SWRConfig
			value={{
				fetcher,
				revalidateOnFocus: false,
				revalidateOnReconnect: false,
				dedupingInterval: 2 * 60 * 1000,
				focusThrottleInterval: 60 * 1000,
				errorRetryCount: 2,
				errorRetryInterval: 3000,
				onError: (error) => {
					// Only log non-404 errors to reduce noise
					if (!error.message?.includes("404")) {
						console.error("SWR Error:", error);
					}
				},
			}}
		>
			{children}
		</SWRConfig>
	);
}
