import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function JoinPage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	const cookieStore = await cookies();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const inviter = await prisma.user.findUnique({
		where: {
			inviteCode: code,
		},
		select: {
			id: true,
			name: true,
			username: true,
			title: true,
		},
	});

	if (!inviter) {
		return (
			<div className="bg-background/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center">
				<div className="max-w-md mx-auto px-6 text-center space-y-6">
					<div className="space-y-2">
						<h1 className="text-3xl tracking-tight">Invalid Invite Link</h1>
						<p className="text-muted-foreground">
							Looks like this invite link doesn&apos;t exist or it&apos;s
							expired.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild>
							<Link href="/">Go home</Link>
						</Button>
						<Button asChild variant="secondary">
							<Link href="mailto:hello@spaces.cv">Contact support</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (session?.user) redirect("/");

	cookieStore.set("invite_referrer", code, {
		maxAge: 24 * 60 * 60,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	return <div>{code}</div>;
}
