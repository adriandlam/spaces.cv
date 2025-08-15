import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function fetcher(url: string) {
	return fetch(url).then((res) => {
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		return res.json();
	});
}

export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(null, args), delay);
	};
}
