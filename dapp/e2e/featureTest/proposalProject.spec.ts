import { expect, test } from "@playwright/test";
import { chromium, type BrowserContext, type Page } from "playwright";
import { githubRepoURL, infoFileHash, wallet1, walletExtensionPath } from "../constants";
import { getPage, connectWalletWithSeeds } from "../wallet-helper";

import {
    generateRandomProjectName,
    generateRandomProposalName,
    generateRandomWords,
    generateRandomString,
    sleep,
} from "../utils";

import { registeredProjectNames } from "./projectName";

test.describe('Proposal Test', () => {
    let context: BrowserContext;
    let page: Page;
    const projectName = generateRandomProjectName();
    const index = registeredProjectNames.length;    
  
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext("", {
            headless: false,
            args: [
            `--disable-extensions-except=${walletExtensionPath}`,
            `--load-extension=${walletExtensionPath}`,
            ],
        });
        const pages = context.pages();
        page = pages[0] || await context.newPage();

        const WalletPage = await getPage(context, 1);
        await connectWalletWithSeeds(WalletPage, wallet1);
        await page.goto("http://localhost:4321/");
        await expect(page).toHaveURL("http://localhost:4321/");
        await expect(page.getByTestId("connect-wallet-button")).toHaveText("Connect");
        await page.getByTestId("connect-wallet-button").click();
        await page.getByText("Freighter").click();
        const walletPage1 = await getPage(context, 1);
        await walletPage1.getByRole("button", { name: "Connect" }).click();
        await walletPage1.close();
        await expect(page.getByTestId('connect-wallet-button')).toHaveText("GAYW7...OAEFV");
    });

    test('Check Proposal Feature!', async () => {
        if(page){
            await page.goto(`/proposal/new?name=${registeredProjectNames[index - 1]}`);
            const proposalName = generateRandomProposalName();
            const proposalDescription = generateRandomWords(12);
            await page.getByTestId("proposal-name").fill(proposalName);
            await page.getByLabel("editable markdown").fill(proposalDescription);
            await page
                .getByTestId("proposal-approved-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-approved-xdr")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-rejected-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-rejected-xdr")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-cancelled-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-cancelled-xdr")
                .fill(generateRandomWords(3));
            await sleep(1000);
            await page.getByTestId("submit-proposal-button").click();
            const signWalletPage = await getPage(context, 1);
            await signWalletPage.getByRole("button", { name: "Sign" }).click();
            const walletExtensionPage = await getPage(context, 1);
            await walletExtensionPage.getByText("Review").click();
            await walletExtensionPage.getByText("Approve and continue").click();
            await walletExtensionPage.getByText("Sign Transaction").click();
        }
    })

    test('Check Validation Input Feature!', async () => {
        if(page){
            await page.goto(`/proposal/new?name=${registeredProjectNames[index - 1]}`);
            await expect(page.locator("#new-proposal-topic")).toHaveText("Create Proposal");

            const proposalName = generateRandomProposalName();
            const proposalDescription = generateRandomWords(12);
            await page.getByTestId("proposal-name").fill("");
            await page.getByLabel("editable markdown").fill(proposalDescription);
            await page
                .getByTestId("proposal-approved-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-approved-xdr")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-rejected-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-rejected-xdr")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-cancelled-description")
                .fill(generateRandomWords(3));
            await page
                .getByTestId("proposal-cancelled-xdr")
                .fill(generateRandomWords(3));
            await sleep(1000);
            await page.getByTestId("submit-proposal-button").click();

            page.on('dialog', async (dialog) => {
                expect(dialog.message()).toBe('Proposal name is required');
                await dialog.accept();
            });  
            await page.getByTestId("proposal-name").fill(proposalName);
            await page.getByTestId("submit-proposal-button").click();
        }
    })
})