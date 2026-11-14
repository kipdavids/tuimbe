export const Skeleton = ({ n = 4 }: { n?: number }) => (
  <div className="space-y-3 p-4">{Array.from({ length: n }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-black/5 dark:bg-white/10" />)}</div>
);
