import Academy from "../components/Academy";

export default async function Page({ params }) {
  const { path = [] } = await params;
  return <Academy path={path} />;
}
