export function onDomReady(f: () => any) {
    if (document.readyState === "complete") {
        f()
    } else {
        document.addEventListener("DOMContentLoaded", () => f())
    }
}

