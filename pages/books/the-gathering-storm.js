export async function getServerSideProps() {
  return { redirect: { destination: "/books", permanent: false } };
}

export default function HiddenSeriesBook() {
  return null;
}
