import React from "react";
import * as ReactDOM from "react-dom/client";
import {
  getSearchMode,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
} from "../common/types";
import { getActions } from "./actions";
import { Search } from "./components/Search";
import "./content.css";

const tabButlerModalRoot = document.createElement("tab-butler-modal");
const tabButlerModalBody = document.createElement("tab-butler-modal-body");
const shadow = tabButlerModalBody.attachShadow({ mode: "open" });
tabButlerModalRoot.appendChild(tabButlerModalBody);
let isOpen = false;
let currentSearchMode: SearchMode;
// is there a better way to do this??? should i just attach it in the beggining and then move on?
let reactRoot: ReactDOM.Root | null = null;

chrome.runtime.onMessage.addListener(({ message }: MessagePlayload) => {
  // i will need to rename the component from search to something else
  if (
    message === Message.TOGGLE_TAB_ACTIONS ||
    message === Message.TOGGLE_TAB_SEARCH
  ) {
    if (isOpen) {
      // unmountSearchComponent();
      unmountSearchComponentFromMessage(message);
    } else {
      mountSearchComponent(message);
    }
  }
});

function mountSearchComponent(message: Message) {
  // Message.TOGGLE_TAB_ACTIONS | Message.TOGGLE_TAB_SEARCH
  if (message === Message.TOGGLE_TAB_ACTIONS) {
    // render it normally with actions as the received data
    tabButlerModalRoot.classList.toggle("is_visible");
    reactRoot = ReactDOM.createRoot(shadow);
    const searchComponentInstance = React.createElement(Search, {
      shadowRoot: shadow,
      searchMode: SearchMode.TAB_ACTIONS,
      actions: getActions(),
    });
    reactRoot.render(searchComponentInstance);
    currentSearchMode = SearchMode.TAB_ACTIONS;
    isOpen = true;
  } else {
    // default to search
    const messagePayload = {
      message: Message.GET_TAB_DATA,
    };
    chrome.runtime.sendMessage(messagePayload, (response: TabData[]) => {
      // going to leave this in here as we need to wait for the responce before making the modal root visible
      // all the needed data should be present before anything is mounted
      tabButlerModalRoot.classList.add("is_visible");
      reactRoot = ReactDOM.createRoot(shadow);
      const searchComponentInstance = React.createElement(Search, {
        shadowRoot: shadow,
        searchMode: SearchMode.TAB_SEARCH,
        currentTabs: response,
      });
      reactRoot.render(searchComponentInstance);
      currentSearchMode = SearchMode.TAB_SEARCH;
      isOpen = true;
      // try and cache tabData array
      // the only times it should not be "used" is if the component is unmounted
      // it migtn have to be cleared after a period of time
    });
  }
}

function unmountSearchComponentFromMessage(message: Message) {
  // Message.TOGGLE_TAB_ACTIONS | Message.TOGGLE_TAB_SEARCH
  // get the accosiated search type of the message
  let requestedSearchMode = getSearchMode(message);
  if (currentSearchMode === requestedSearchMode) {
    // if the search type of the currently open search compenent is the same
    // as the the received one, the user issued the same command
    // meaning they just want to toggle it of
    unmountSearchComponent();
  } else {
    // in this case, the user wants to switch to a different search type
    // update the props of the component with the nessecary information
    // and update the cuttent search type
    if (requestedSearchMode === SearchMode.TAB_ACTIONS) {
      const newComponentInstance = React.createElement(Search, {
        shadowRoot: shadow,
        searchMode: requestedSearchMode,
        actions: getActions(),
      });
      reactRoot?.render(newComponentInstance);
      currentSearchMode = requestedSearchMode;
    } else {
      const messagePayload = {
        message: Message.GET_TAB_DATA,
      };
      chrome.runtime.sendMessage(messagePayload, (response: TabData[]) => {
        const searchComponentInstance = React.createElement(Search, {
          shadowRoot: shadow,
          searchMode: requestedSearchMode,
          currentTabs: response,
        });
        reactRoot?.render(searchComponentInstance);
        currentSearchMode = requestedSearchMode;
      });
    }
  }
}

function unmountSearchComponent() {
  tabButlerModalRoot.classList.toggle("is_visible");
  reactRoot?.unmount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild);
  }
  reactRoot = null;
  isOpen = false;
}

// remove these listeners on page exit
// window.addEventListener("click", () => {
//   if (isOpen) {
//     unmountSearchComponent();
//   }
// });

// remove these listeners on page exit
window.addEventListener("keydown", (event) => {
  const eventKey = event.key.toLowerCase();
  if (eventKey === "escape" && isOpen) {
    // toggleModal();
    unmountSearchComponent();
  }
});

// remove these listeners on page exit
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && isOpen) {
    unmountSearchComponent();
  }
});

document.body.appendChild(tabButlerModalRoot); // is there a possibility that document.body is null?
