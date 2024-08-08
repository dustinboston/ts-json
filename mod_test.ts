import { assertEquals } from "jsr:@std/assert";
import { convert } from "./mod.ts";
import modJson from "./mod.json" with { type: "json" };

// TODO: Add some better tests
Deno.test("mod.ts is parsed correctly", () => {
    const file = "./mod.ts";
    const decoder = new TextDecoder();
    const data = decoder.decode(Deno.readFileSync(file));
    const json = convert(file, data);

    assertEquals(json, JSON.stringify(modJson, null, 2));
});
