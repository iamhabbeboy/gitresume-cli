import { Grip, Plus } from "lucide-react";
import { Card } from "../../ui/Card";
import { Reorder, useDragControls } from "motion/react";
import type { ReOrderType } from "../type";
import { Button } from "../../ui/Button";

const ReOrderSection: React.FC<{ item: ReOrderType }> = ({ item }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      // initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{
        opacity: 0,
        y: 20,
        transition: { duration: 0.3 },
      }}
      whileDrag={{ backgroundColor: "#e3e3e3" }}
      className={item ? "selected" : ""}
      dragListener={false}
      dragControls={controls}
    >
      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3 mb-4">
            <button
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => controls.start(event)}
            >
              <Grip size={20} />
            </button>
            <h2 className="text-xl font-semibold text-card-foreground">
              {item.label}
            </h2>
          </div>
          {item.addEvent && (
            <Button
              onClick={item.addEvent}
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent text-white bg-cyan-600 hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
        {item.component}
      </Card>
    </Reorder.Item>
  );
};
export default ReOrderSection;
