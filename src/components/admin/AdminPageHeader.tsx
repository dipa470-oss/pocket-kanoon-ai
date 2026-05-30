export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
    </div>
  );
}
