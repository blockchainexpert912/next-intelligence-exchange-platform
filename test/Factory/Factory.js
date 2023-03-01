const {
    time,
    loadFixture,
    
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", () => {
    async function deployFactory() {
        const BASE_TOKEN_URI = "https://nextintelligencelicense.com/metadata/";
        const mintPrice = 10_000_000;

        const [owner, addr1, addr2, addr3, newTokenAddr] = await ethers.getSigners();

        const PaymentToken = await ethers.getContractFactory("NextIntelligenceExchangeToken");
        const SmartIntelligenceLicense = await ethers.getContractFactory("SmartIntelligenceLicense");
        const Factory = await ethers.getContractFactory("NextIntelligenceExchangeFactory");

        const paymentToken = await PaymentToken.deploy();
        const smartIntelligenceLicense = await SmartIntelligenceLicense.deploy(BASE_TOKEN_URI, mintPrice, paymentToken.address);
        const factory = await Factory.deploy(paymentToken.address, smartIntelligenceLicense.address);


        await paymentToken.deployed();
        await smartIntelligenceLicense.deployed();
        // await factory.deployed();


        return {
            owner, addr1, addr2, addr3,
            PaymentToken, paymentToken,
            SmartIntelligenceLicense, smartIntelligenceLicense,
            mintPrice,
            newTokenAddr,
            // factoryAddr: factory.address,
            // factory
        }
    }

    describe("Deployment",  async () => {
        const { smartIntelligenceLicenseAddr, paymentTokenAddr } = await loadFixture(deployFactory);
        // it("Should set the right smart intelligence license nft address and payment token address", async () => {
        //     expect(await factory.smartIntelligenceExchangeNFTAddr()).to.equal(smartIntelligenceLicenseAddr);
        //     expect(await factory.enablePaymentTokenAddrs(paymentTokenAddr)).to.equal(true);
        // })
    })
})