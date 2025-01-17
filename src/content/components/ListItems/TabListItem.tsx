import React, { useState } from "react";
import { TabData } from "../../../common/types";
import { HiOutlineGlobe } from "@react-icons/all-files/hi/HiOutlineGlobe";
import { ListItem, ListItemProps } from "./ListItem";
import { useIsDarkMode } from "../hooks";

export const TabListItem = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<TabData>) => {
  // const ref = useScroll(selected);
  const [hasImageError, setHasImageError] = useState(false);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();

  const getHostname = (url: string) => {
    return new URL(url).hostname;
  };
  const getFallBackIcon = () => (
    <HiOutlineGlobe
      size="24px"
      color={isDarkMode ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.36)"}
    />
  );
  return (
    <ListItem
      // style={style}
      onClick={() => onClick(data)}
      selected={selected}
      // ref={ref}
      onMouseOver={onHover}
    >
      {/* handle potential image error when trying to load favicon  */}
      {data.favIcon ? (
        hasImageError ? (
          getFallBackIcon()
        ) : (
          <img src={data.favIcon} onError={() => setHasImageError(true)} />
        )
      ) : (
        getFallBackIcon()
      )}
      <div className="text_container">
        <div className="main_text">{data.tabTitle}</div>
        {/* getHostname() could return an empty host name - should the secondary text be conditionally rendered? */}
        {/* show if in current window */}
        {/* <div className="secondary_text">
          {data.inCurrentWindow
            ? `${getHostname(data.tabUrl)} \u00b7 Current Window`
            : getHostname(data.tabUrl)}
        </div> */}
        <div className="secondary_text">
          {/* incase getHostname() returns an empty string */}
          {getHostname(data.tabUrl) || data.tabUrl}
        </div>
      </div>
    </ListItem>
  );
};
