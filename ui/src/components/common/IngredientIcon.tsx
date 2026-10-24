import { isImage } from "../../data/ingredients";

interface IngredientIconProps {
    value: string;
    border: string;
    bg: string;
    small?: boolean;
}

export default function IngredientIcon({ value, border, bg, small }: IngredientIconProps) {
    const box = small ? "size-7 rounded-md text-base" : "size-10 rounded-lg text-xl";
    return (
        <span className={`flex shrink-0 items-center justify-center overflow-hidden border-2 ${box} ${border} ${bg}`}>
            {isImage(value) ? <img src={value} alt="" className="size-full object-cover" /> : value}
        </span>
    );
}
