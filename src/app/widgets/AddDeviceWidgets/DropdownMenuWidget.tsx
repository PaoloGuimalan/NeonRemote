import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuWidgetInterface } from "@/hooks/interfaces"

export default function DropdownMenuWidget({ position, labels, list, setPosition }: DropdownMenuWidgetInterface) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <Button variant="outline" className={`w-full flex justify-start ${position === "none" ? "font-normal text-[#808080]" : "font-semibold text-black"}`}>{labels[position]}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          {list.map((mp: any, i: number) => {
            return(
              <DropdownMenuRadioItem key={i} value={mp.value}>{mp.label}</DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
