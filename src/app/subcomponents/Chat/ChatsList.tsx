import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";

function ChatsList() {
  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[20px]">
      <div className="w-full flex flex-row sticky top-0">
        <div className="flex flex-row gap-[20px] items-center">
          <span className="text-[20px] font-semibold">Chats</span>
          <Button
            variant="outline"
            className="gap-[5px] text-[12px] h-[35px] w-[130px] items-center justify-center bg-black text-white hover:bg-black hover:text-white"
          >
            <IoMdAdd style={{ fontSize: "15px", color: "#ffffff" }} />
            <span>New Chat?</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatsList;
