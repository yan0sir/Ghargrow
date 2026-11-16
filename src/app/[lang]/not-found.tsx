import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sky-gradient">
      <div className="wrap flex min-h-[80svh] flex-col justify-end pt-40 pb-24">
        <h1 className="display-xl mt-4">Off the track.</h1>
        <p className="lead mt-6 max-w-lg">This field is empty. · هذه الصفحة غير موجودة.</p>
        <div className="mt-10 flex gap-4">
          <Link href="/en" className="bg-ink-900 px-6 py-3 text-white hover:bg-green-700">
            Home
          </Link>
          <Link href="/ar" className="border border-ink-900 px-6 py-3 text-ink-900">
            الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
