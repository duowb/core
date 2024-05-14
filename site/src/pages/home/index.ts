import { Page } from "@/router";
import "./style.scss";
import { FastjsDom, FastjsDomList, dom } from "jsfast";
import copy from "@/assets/copy.svg";
import { utils } from "jsfast";
import { success } from "@/components/message/message";

async function animation(root: FastjsDom) {
  const animationList = root.next<FastjsDomList>("[key]");
  animationList.sort(
    (a, b) => Number(a.getAttr("key") || "0") - Number(b.getAttr("key") || "0")
  );

  for (let key = 0; key < animationList.length; key++) {
    const el = animationList[key];
    const content = el.getAttr("content");
    const move = el.getAttr("move");
    await delay(200);

    if (content) {
      await typeText(content, el);
    } else if (move !== null) {
      const target = root.next<FastjsDom>(`[move-target="${key}"]`);
      const hide = target.getAttr("hide");

      target.setStyle("width", hide + "px");
      el.setStyle("width", move + "px");
      await delay(300);

      const diff = target.el().offsetLeft - el.el().offsetLeft;
      el.setStyle("transform", `translateX(${diff}px)`);
      await delay(600);

      target.setAttr("hide", null);
      el.setStyle("width", "0");
    }
  }

  await delay(2000);
  startRollText(root);
}

async function startRollText(root: FastjsDom) {
  const list = ["Easi", "Bett", "Fast"];
  const el = root.next<FastjsDom>("[change]");
  let roll = 0;

  while (true) {
    await deleteText(el);
    await delay(200);
    await typeText(list[roll++ % list.length], el);
    await delay(2000);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(text: string, el: FastjsDom) {
  let textArr = text.split("");
  for (let i = 0; i < textArr.length; i++) {
    el.html((el.html() + textArr[i]).replace(/ /g, "&nbsp;"));
    await delay(100);
  }
}

async function deleteText(el: FastjsDom) {
  let text = el.html();
  for (let i = text.length; i >= 0; i--) {
    el.html(text.slice(0, i));
    await delay(100);
  }
}

const page: Page = {
  path: "/",
  load: (root) => {
    setTimeout(() => {
      animation(root);
    }, 1000);
    dom.select(".code")?.addEvent("click", () => {
      utils.copy("npm create fastjs");
      success("Copied to clipboard");
    });
  },
  template: `
    <div class="main">
      <div id="title-movie">
        <span key="0" content="Write"></span>
        <div move-target="1" hide="85">JS</div>
        <span change>Fast</span><span key="2" content="er"></span>
        <div key="1" move="70">&nbsp;JS</div>
      </div>
      <p>Fly again, with our dream.</p> 
      <div class="code-container">
      <span class="code">
        <span>shell</span>
        <span class="divider"></span>
        <span style="color: #aa6e6a">npm</span>
        <span style="color: #dfbc67">create</span>
        <span style="color: #84d681;">fastjs</span>
        <span class="divider"></span>
        <img src="${copy}" />
      </span>
      </div>
    </div>
  `
};

export default page;