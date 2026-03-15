/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  AuthStateInterface,
  IConversation,
  IPagination,
} from "@/hooks/interfaces";
import { GetMessagesListRequest } from "@/hooks/requests";
import { formatToWords } from "@/hooks/reusables";
import { paginationstate } from "@/hooks/states";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { TbDevicesOff } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function ChatsList() {
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication,
  );

  const [messageslist, setmessageslist] =
    useState<IPagination<IConversation>>(paginationstate);

  const navigate = useNavigate();

  useEffect(() => {
    if (authentication.user.token) {
      GetMessagesListRequest({ token: authentication.user.token })
        .then((response) => {
          setmessageslist(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [authentication]);

  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[20px]">
      <div className="w-full flex flex-row sticky top-0 h-[30px]">
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
      {messageslist.results.length > 0 ? (
        <div className="w-full flex flex-row flex-wrap gap-[10px] justify-center lg:justify-start">
          {messageslist.results.map((mp: IConversation, i: number) => {
            return (
              <div
                key={i}
                onClick={() => {
                  navigate(`/chat/${mp.conversation_id}`);
                }}
                className="flex flex-col border-[2px] rounded-[7px] border-[#e5e6ea] p-[20px] w-full max-w-[250px] h-[170px] max-h-[170px] cursor-pointer select-none"
              >
                <div className="w-full bg-transparent flex flex-row gap-[10px] items-center">
                  <span className="text-[14px] font-semibold flex flex-1">
                    {mp.name}
                  </span>
                  <div className="w-[10px] h-[10px] bg-[#b3b3b3] rounded-[12px]" />
                </div>
                <div className="w-full flex flex-1 items-center">
                  <span
                    className="text-[14px] text-left font-Inter text-[#525252] leading-[1.4] 
                      line-clamp-3 [-webkit-line-clamp:3] [-webkit-box-orient:vertical] 
                      overflow-hidden display[-webkit-box]"
                  >
                    {mp.latest_message?.content}
                  </span>
                </div>
                <div className="w-full bg-transparent flex flex-row gap-[10px] items-center">
                  <span className="text-[12px] font-Inter flex flex-1">
                    {formatToWords(mp.created_at)}
                  </span>
                  <span className="text-[12px] font-Inter">
                    {mp.latest_message?.created_at &&
                      formatToWords(mp.latest_message?.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-full flex justify-center rounded-[10px]">
          <div className="flex flex-col items-center gap-[12px] mt-[15%] w-fit h-fit">
            <TbDevicesOff style={{ fontSize: "100px", color: "#4d4d4d" }} />
            <span className="text-[14px] font-semibold text-[#4d4d4d]">
              No Devices listed yet
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatsList;
