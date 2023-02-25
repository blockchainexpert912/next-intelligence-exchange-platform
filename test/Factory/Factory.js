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
        const Factory = await ethers.getContractFactory("Factory");

        const paymentToken = await PaymentToken.deploy();
        const smartIntelligenceLicense = await SmartIntelligenceLicense.deploy(BASE_TOKEN_URI, mintPrice, paymentToken.address);

        await paymentToken.deployed();
        await smartIntelligenceLicense.deployed();
        const factory = await Factory.deploy()


        return {
            owner, addr1, addr2, addr3,
            PaymentToken, paymentToken,
            SmartIntelligenceLicense, smartIntelligenceLicense,
            mintPrice,
            newTokenAddr,
            paymentTokenAddr: paymentToken.address,
            smartIntelligenceLicenseAddr: smartIntelligenceLicense.address,
            factoryAddr: factory.address,
            factory
        }
    }

    describe("Deployment",  async () => {
        const { factory } = await loadFixture(deployFactory);
    })
})