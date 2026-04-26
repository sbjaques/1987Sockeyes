import { LeaveNoteButton } from './LeaveNoteButton';

interface Props {
  target: string;
  targetLabel: string;
  count?: number;
}

export function CommentIcon({ target, targetLabel, count }: Props) {
  return (
    <div
      className="absolute bottom-2 right-2"
      onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <LeaveNoteButton target={target} targetLabel={targetLabel} variant="icon" />
        {count != null && count > 0 && (
          <span className="absolute -top-1 -right-1 bg-crimson text-cream text-[9px] px-1 rounded-full font-bold">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </div>
  );
}
