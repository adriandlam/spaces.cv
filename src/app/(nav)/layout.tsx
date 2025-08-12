import Nav from "@/components/nav";
import HomeHeader from "@/components/home-header";

export default function NavLayout({
	children,
	modal,
}: {
	children: React.ReactNode;
	modal: React.ReactNode;
}) {
	return (
		<div className="flex">
			<Nav />
			<div className="flex-1 px-6 py-4 flex flex-col gap-4">
				<HomeHeader />
				{children}
			</div>
			{modal}
		</div>
	);
}
