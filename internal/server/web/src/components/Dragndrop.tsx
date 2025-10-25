import { Reorder } from "motion/react";
import { useState } from "react";

const Dragndrop = () => {
    const item = ["Tomato", "Orange", "Beans"];
    const [items, setItems] = useState(item);

    return (
        <Reorder.Group axis="y" values={items} onReorder={setItems}>
            {items.map((item) => (
                <Reorder.Item key={item} value={item}>
                    {item}
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
};
export default Dragndrop;
