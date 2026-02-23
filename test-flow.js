// Automated test for DeckForge flow
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '.tmp', 'screenshots');
const TEST_EMAIL = `test-${Date.now()}@deckforge.test`;
const TEST_PASSWORD = 'TestPassword123!';

// Sample content for testing
const SAMPLE_CONTENT = `FDI in Ethiopia: Strategic Opportunities

Ethiopia presents compelling opportunities for foreign direct investment across multiple sectors. The country has experienced rapid economic growth, averaging 9-10% GDP growth over the past decade.

Key Investment Sectors:
1. Manufacturing - Government incentives for textile, leather, and agro-processing industries
2. Agriculture - Vast arable land with potential for commercial farming
3. Technology - Growing tech hub with young, educated workforce
4. Infrastructure - Massive investments in roads, railways, and energy projects
5. Tourism - Rich cultural heritage and natural attractions

Investment Incentives:
- Tax holidays up to 7 years for priority sectors
- Duty-free import of capital goods
- Access to industrial parks with ready infrastructure
- Streamlined one-stop-shop licensing process

Market Advantages:
- Population of 120+ million people (second largest in Africa)
- Strategic location with access to Middle East and African markets
- Membership in COMESA and African Continental Free Trade Area
- Competitive labor costs compared to regional peers

Challenges and Mitigation:
- Foreign exchange constraints - Government working on reforms
- Infrastructure gaps - Ongoing major investments
- Bureaucratic processes - New investment law simplifies procedures

Recent Success Stories:
- H&M and PVH opened large textile facilities
- Unilever expanded manufacturing operations
- Ethiopian Airlines partnership with Boeing for aviation services
- Multiple Chinese manufacturers established operations

Future Outlook:
The government's 10-year development plan targets transforming Ethiopia into a middle-income country by 2030, with FDI playing a central role in industrialization and job creation.`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}.png`);
}

async function runTest() {
  console.log('🚀 Starting DeckForge automated test...\n');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--start-maximized'],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    // 1. Navigate to homepage
    console.log('1️⃣  Navigating to homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-homepage');

    // 2. Go to signup
    console.log('2️⃣  Going to signup page...');
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '02-signup-page');

    // 3. Sign up
    console.log(`3️⃣  Signing up with ${TEST_EMAIL}...`);

    // Fill in all form fields
    await page.type('#fullName', 'Test User');
    await page.type('#email', TEST_EMAIL);
    await page.type('#password', TEST_PASSWORD);
    await page.type('#confirmPassword', TEST_PASSWORD);

    await sleep(500);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    await takeScreenshot(page, '03-dashboard');
    console.log('✅ Signup successful\n');

    // 4. Create new deck
    console.log('4️⃣  Creating new deck...');
    await page.goto(`${BASE_URL}/dashboard/new`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '04-new-deck-page');

    // 5. Fill in deck form
    console.log('5️⃣  Filling in deck details...');
    await page.type('input[placeholder*="title" i], input[name="title"]', 'FDI in Ethiopia');

    // Find and fill textarea
    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].type(SAMPLE_CONTENT);
    }

    // Set parameters
    await page.select('select[name="tone"]', 'formal');
    await page.select('select[name="audience"]', 'investors');
    await page.select('select[name="slideCount"]', '15');

    await takeScreenshot(page, '05-form-filled');

    // 6. Submit and generate
    console.log('6️⃣  Submitting to generate deck...');
    await page.click('button[type="submit"]');

    // Wait for navigation to project page
    console.log('⏳ Waiting for generation to start...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await takeScreenshot(page, '06-generating');

    // 7. Wait for generation to complete
    console.log('⏳ Waiting for AI to generate presentation (may take 30-60 seconds)...');
    let attempts = 0;
    let completed = false;

    while (attempts < 40 && !completed) {
      await sleep(3000);
      attempts++;

      // Check if status changed to READY
      const statusElement = await page.$('text/Ready');
      if (statusElement) {
        completed = true;
        console.log('✅ Generation completed!\n');
        break;
      }

      // Check for errors
      const errorElement = await page.$('text/Error');
      if (errorElement) {
        console.log('❌ Generation failed with error');
        await takeScreenshot(page, '07-error');
        throw new Error('Generation failed');
      }

      console.log(`   Checking status... (${attempts}/40)`);
    }

    if (!completed) {
      throw new Error('Generation timed out after 2 minutes');
    }

    await takeScreenshot(page, '07-ready');

    // 8. Check slide count
    console.log('8️⃣  Checking generated slides...');
    const slideElements = await page.$$('[class*="slide"]');
    const slideCount = slideElements.length;
    console.log(`📊 Generated ${slideCount} slides`);

    // 9. Download deck
    console.log('9️⃣  Downloading deck...');
    const downloadButton = await page.$('a:has-text("Download"), button:has-text("Download")');
    if (downloadButton) {
      await downloadButton.click();
      console.log('✅ Download initiated\n');
      await sleep(2000);
      await takeScreenshot(page, '08-downloaded');
    } else {
      console.log('⚠️  Download button not found');
      await takeScreenshot(page, '08-no-download');
    }

    // 10. Final summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📧 Test account: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    console.log(`📊 Slides generated: ${slideCount}`);
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error(error.stack);
    await takeScreenshot(page, 'ERROR');
  } finally {
    await sleep(3000);
    await browser.close();
  }
}

// Run the test
runTest().catch(console.error);
