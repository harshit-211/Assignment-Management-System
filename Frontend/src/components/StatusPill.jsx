const styles = {
  confirmed: 'bg-forest-light text-forest-dark',
  pending: 'bg-ochre-light text-ochre',
  not_started: 'bg-line/60 text-ink/60',
};

const labels = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  not_started: 'Not started',
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${styles[status] || styles.not_started}`}>
      {labels[status] || status}
    </span>
  );
}
