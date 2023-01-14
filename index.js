import {Command} from 'commander';
import {Browser} from "./src/Browser/browser.js";
import {MainPage} from "./src/ScribbleHub/main-page.js";
import {Chapters} from "./src/ScribbleHub/chapters.js";

const program = new Command();
program
    .name('scribble-to-epub')
    .argument('<url>', 'base url of the Scribble Hub series')
    .argument('<out-file>', 'file name of the generated epub')
    .action(run);

await program.parseAsync();

async function run(urlString, outFile) {
    const url = new URL(urlString);
    const mainPage = new MainPage(url);
    // await mainPage.loadMainPage();

    const chapters = new Chapters(url);
    const chapterUrls = await chapters.loadChapterUrls();

    console.log(chapterUrls);

    await Browser.close();
}
