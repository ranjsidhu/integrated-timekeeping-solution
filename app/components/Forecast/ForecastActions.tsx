import Button from "../Button/Button";

type ForecastActionsProps = {
  handleSave: () => void;
  handleSubmit: () => void;
};

export default function ForecastActions({
  handleSave,
  handleSubmit,
}: ForecastActionsProps) {
  return (
    <div className="flex gap-4 p-6 border-t border-slate-200 bg-white flex-wrap">
      <Button
        kind="secondary"
        size="lg"
        onClick={handleSave}
        className="flex-1 min-w-[120px]"
      >
        Save
      </Button>

      <Button
        kind="primary"
        size="lg"
        onClick={handleSubmit}
        className="flex-1 min-w-[120px]"
      >
        Submit Hours
      </Button>
    </div>
  );
}
