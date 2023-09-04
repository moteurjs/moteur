import { Event, EventManager } from "@webng/event";

export class ButtonClickEvent extends Event {
    public constructor(public id: string) {
        super();
    }
}

export function onButtonClick(button: HTMLButtonElement) {
    const eventManagers: EventManager[] = (window as any).eventManagers ?? [];
    const event = new ButtonClickEvent(button.id);
    eventManagers.forEach((eventManager) => eventManager.queue(event));
}
