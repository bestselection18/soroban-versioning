import { test, expect } from '@playwright/test'

import type { CheckResponse } from '../utils';
import{
    checkString,
    checkImage,
    checkButton,
    checkInput,
    checkColor,
    checkLabel,
} from '../utils'

test.describe("Register page test", () => {
    // Check the Url is correct!
    test("correct Url", async ({ page }) => {
        // ✅ Navigate to the URL first
        await page.goto("http://localhost:4321/register");
        
        // ✅ Then, check if the URL is correct
        await expect(page).toHaveURL("http://localhost:4321/register");
    });
    
    // Check home UI is correct!
    test("home Ui test", async({page}) => {
        const results : CheckResponse[] = [];
    
        await page.goto("http://localhost:4321/register");
    
        // Check if Images exsit
        results.push(await checkImage(page, undefined, "Logo", "Logo"));
        results.push(await checkImage(page, undefined, "(//)", "(//)"));
        results.push(await checkImage(page, "footer-github"));
        results.push(await checkImage(page, "footer-stellar"));
        results.push(await checkImage(page, "footer-discord"));
    
        // Check Labels exist
        results.push(await checkLabel(page, undefined, "project"));
        results.push(await checkLabel(page, undefined, "Maintainers"));
        results.push(await checkLabel(page, undefined, "GitHub repository URL"));
        results.push(await checkLabel(page, undefined, "Information file hash"));
        
        // Check general Strings exist
        results.push(await checkString(page, "navbar-default", "Tansu"));
        results.push(await checkString(page, "navbar-default", "Alpha"));   
        results.push(await checkString(page, "register-title", "Register"));  
        results.push(await checkString(page, "register-description", "Register a new project on-chain"));  
        results.push(await checkString(page, "footer-label", `© ${new Date().getFullYear()} Tansu, Consulting Manao GmbH`));  
    
        //Check if the button exists
        results.push(await checkButton(page, "connect-wallet-button", "Connect"))
        results.push(await checkButton(page, "register-project-button", "Register on-chain"))
        
          
        //Check if the inputs exist
        results.push(await checkInput(page, "project_name", "Project name (lowercase, only chars)", "Stellar", "Stellar"));
        results.push(await checkInput(page, "maintainers", "SearcList of maintainers' addresses as G...,G...", "Stellar", "Stellar"));
        results.push(await checkInput(page, "config_url", "GitHub repository URL", "Stellar", "Stellar"));
        results.push(await checkInput(page, "config_hash", "Information file hash", "Stellar", "Stellar"));
    
        // Check the color
        results.push(await checkColor(page, "footer-parent", "rgb(190, 242, 100)", 13));
        results.push(await checkColor(page, "register-form", "rgb(244, 244, 245)"));
    
        // Ensure all checks passed
        for (const result of results) {
            if (result.error) {
                throw new Error(`Label check failed: ${result.error}`);
            }
        }
    })
});