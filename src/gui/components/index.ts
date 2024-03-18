import bevelbox from "./bevelbox";
import button from "./button";
import circleLoader from "./circle-loader";
import circleTimer from "./circle-timer";
import cursor from "./cursor";
import flexContainer from "./flex-container";
import iconButton from './icon-button';
import iconLabelButton from "./icon-label-button";
import interactable from "./interactable";
import input from "./input";
import item from "./item";
import label from "./label";
import progressBar from "./progress-bar";
import rounded from './rounded';
import slider from "./slider";
import troikaTextComponent from "./troika-text-component";
import imageCube from "./image-cube";
import catalogImage from "../../react/components/dnd-image";
import baseInteractive from "./base-interactive";
import menuContainer from "./menu-container";
import transformer from "./transformer";
import modelItem from "./model-item";
import flashRed from "../../react/components/flash-red";
import canvasImage from "../../react/components/canvas-image";
import container from "./container";
import radioComponent from "./radio";
import dualArcs from "./dual-arcs";
import skeletonBody from "./skeleton-body";

import checkbox from "./checkbox";
import textField from './text-field'
export default function () {
    dualArcs();
    checkbox();
    container();
    textField();
    skeletonBody();
    transformer();
    radioComponent();
    canvasImage();
    flashRed();
    modelItem();
    troikaTextComponent();
    menuContainer();
    baseInteractive();
    imageCube();
    catalogImage();
    bevelbox();
    button();
    circleLoader();
    circleTimer();
    cursor();
    flexContainer();
    iconButton();
    iconLabelButton();
    interactable();
    input();
    item();
    label();
    progressBar();
    rounded();
    slider();
}
