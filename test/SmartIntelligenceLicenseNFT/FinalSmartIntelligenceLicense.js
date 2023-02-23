const {
    time,
    loadFixture,
    
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartIntelligenceLicense", () => {
    async function deploySmartIntelligenceLicenseFixture() {
        const BASE_TOKEN_URI = "https://nextintelligencelicense.com/metadata/";
        const mintPrice = 10_000_000;
        const [owner, addr1, addr2, addr3, newTokenAddr] = await ethers.getSigners();

        const PaymentToken = await ethers.getContractFactory("NextIntelligenceExchangeToken");
        const SmartIntelligenceLicense = await ethers.getContractFactory("SmartIntelligenceLicense");

        const paymentToken = await PaymentToken.deploy();
        const smartIntelligenceLicense = await SmartIntelligenceLicense.deploy(BASE_TOKEN_URI, mintPrice, paymentToken.address);

        await paymentToken.deployed();
        await smartIntelligenceLicense.deployed();

        return {
            owner, addr1, addr2, addr3,
            PaymentToken, paymentToken,
            SmartIntelligenceLicense, smartIntelligenceLicense,
            mintPrice,
            newTokenAddr
        }
    }

    describe("Deployment", () => {
        it("Should set the right payment token", async () => {
            const { smartIntelligenceLicense, paymentToken } = await loadFixture(deploySmartIntelligenceLicenseFixture);
            expect(await smartIntelligenceLicense.getPaymentToken()).to.equal(paymentToken.address)
        });

        it("Should set the right mint price", async () => {
            const { mintPrice, smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);
            expect(await smartIntelligenceLicense.getMintPrice()).to.equal(mintPrice);
        });

    })

    describe("Price", () => {
        describe("Validations", async () => {

            it("Should revert with the right error and fail if the current mint price and new mint price are same", async () => {
                const { smartIntelligenceLicense, mintPrice } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await expect(smartIntelligenceLicense.setMintPrice(mintPrice)).to.be.revertedWith("NEW_STATE_IDENTICAL_TO_OLD_STATE");
            })

            it("Should revert with the right error and fail if the caller is not owner", async () => {
                const { smartIntelligenceLicense, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const newMintPrice = 10_000;
                await expect(smartIntelligenceLicense.connect(addr1).setMintPrice(newMintPrice)).to.be.revertedWith("Ownable: caller is not the owner");
            })

        })

        describe("Events", async () => {
            it("Should emit the event on setting mint price", async () => {
                const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);

                const oldMintPrice = await smartIntelligenceLicense.getMintPrice();

                const newMintPrice = 100_000;
                await expect(smartIntelligenceLicense.setMintPrice(newMintPrice))
                    .to.emit(smartIntelligenceLicense, "UpdateMintPrice")
                    .withArgs(oldMintPrice, newMintPrice);
            })
        })

        describe("Sets Price", async () => {
            it("Should set the right new mint price", async () => {
                const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const newMintPrice = 100_000;
                await smartIntelligenceLicense.setMintPrice(newMintPrice);
                expect(await smartIntelligenceLicense.getMintPrice()).to.equal(newMintPrice);
            })
        })
    })

    describe("Pause", async () => {
        describe("Validations", async () => {
            it("Should revert with the right error and fail if the caller is not owner", async () => {
                const { smartIntelligenceLicense, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const newVal = !(await smartIntelligenceLicense.getPause());
                await expect(smartIntelligenceLicense.connect(addr1).pause(newVal)).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("Should revert with the right error and fail if new value and old value are same", async () => {
                const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const newVal = await smartIntelligenceLicense.getPause();
                await expect(smartIntelligenceLicense.pause(newVal)).to.be.revertedWith("NEW_STATE_IDENTICAL_TO_OLD_STATE");
            })
        })

        describe("Events", async () => {
            it("Should emit the events on updating pause status", async () => {
                const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const oldVal = await smartIntelligenceLicense.getPause();
                const newVal = !oldVal;
                await expect(smartIntelligenceLicense.pause(newVal)).to.emit(smartIntelligenceLicense, "UpdatePause").withArgs(oldVal, newVal);
            })
        })

        describe("Sets Pause", async () => {
            const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);

            const newVal = !(await smartIntelligenceLicense.getPause());
            await smartIntelligenceLicense.pause(newVal);
            expect(await smartIntelligenceLicense.getPause()).to.equal(newVal);
        })
    })

    describe("Payment Token", async () => {
        describe("Validations", async () => {
            it("Should reverse with the right error and fail if the caller is not owner", async () => {
                const { smartIntelligenceLicense, newTokenAddr, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await expect(smartIntelligenceLicense.connect(addr1).setPaymentToken(newTokenAddr.address)).to.revertedWith("Ownable: caller is not the owner");
            })

            it("Should reverse with the right error and fail if the old token address and new token address are same", async () => {
                const { smartIntelligenceLicense, paymentToken } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await expect(smartIntelligenceLicense.setPaymentToken(paymentToken.address)).to.revertedWith("NEW_STATE_IDENTICAL_TO_OLD_STATE")

            })
        })

        describe("Events", async () => {
            it("Should emit the right events on update payment token", async () => {
                const { smartIntelligenceLicense, newTokenAddr, paymentToken } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await expect(smartIntelligenceLicense.setPaymentToken(newTokenAddr.address)).to.emit(smartIntelligenceLicense, "UpdatePaymentToken").withArgs(paymentToken.address, newTokenAddr.address)
            })
        })

        describe("Sets New Payment Token", async () => {
            it("Should set the right new payment token address", async () => {
                const { smartIntelligenceLicense, newTokenAddr } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await smartIntelligenceLicense.setPaymentToken(newTokenAddr.address);
                expect(await smartIntelligenceLicense.getPaymentToken()).to.equal(newTokenAddr.address);
            })
        })

    })

    describe("Adopt", async () => {
        describe("Validations", async () => {
            it("Should reverse with the right error and fail if paused is true", async () => {
                const { smartIntelligenceLicense } = await loadFixture(deploySmartIntelligenceLicenseFixture);

                await smartIntelligenceLicense.pause(true);

                await expect(smartIntelligenceLicense.adopt([true, true])).to.revertedWith("Sale is not active currently.");
            })

            it("Should reverse with the right error and fail if you don't have enough payment token", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                paymentToken.transfer(addr1.address, 10_000_000 - 100000);
                await expect(smartIntelligenceLicense.connect(addr1).adopt([true, true])).to.revertedWith("The ERC20 token amount sent is not correct or Insuffient ERC20 Token amount sent.");
            })
        })

        describe("Mint", async () => {
            it("Should mint correctly", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await smartIntelligenceLicense.connect(addr1).adopt([true, true]);

                expect(await smartIntelligenceLicense.balanceOf(addr1.address)).to.equal(1);
                expect(await smartIntelligenceLicense.totalSupply())
                    .to.equal(1);
            })

            it("Should get token Ids from owner address", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await smartIntelligenceLicense.connect(addr1).adopt([true, true]);

                expect(((await smartIntelligenceLicense.walletOfOwner(addr1.address))[0])).to.equal("1");
            })

        })

        describe("Events", async () => {
            it("Should emit right event on minting new model", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await expect(smartIntelligenceLicense.connect(addr1).adopt([true, true]))
                    .to.emit(smartIntelligenceLicense, "NewModelMint")
                    .withArgs(addr1.address, mintPrice)
            })
        })
    })

    describe("Withdraw", async () => {
        describe("Validations", async () => {
            it("Should reverse with the right error and fail if the caller is not owner", async () => {
                const { smartIntelligenceLicense, owner, paymentToken, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const depositAmount = 100_000;
                await paymentToken.transfer(smartIntelligenceLicense.address, depositAmount);
                await expect(smartIntelligenceLicense.connect(addr1).withdraw(depositAmount, paymentToken.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it("Should reverse with the right error and fail if the contact doesn't have enoght balance", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1 } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const depositAmount = 100_000;
                await paymentToken.transfer(smartIntelligenceLicense.address, depositAmount);
                await expect(smartIntelligenceLicense.withdraw(depositAmount + 1, paymentToken.address)).to.be.revertedWith("Not enough balance!");
            })
        })

        describe("Transfer", async () => {
            it("Should transfer the token to owner", async () => {
                const { smartIntelligenceLicense, paymentToken, owner } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                const depositAmount = 10_000;
                const withdrawAmount = depositAmount;
                await paymentToken
                    .transfer(smartIntelligenceLicense.address, depositAmount);

                await expect(smartIntelligenceLicense.withdraw(withdrawAmount, paymentToken.address))
                    .to.changeTokenBalances(paymentToken,
                        [smartIntelligenceLicense.address, owner.address],
                        [-withdrawAmount, withdrawAmount]);
            })
        })
    })

    describe("Setting", async () => {
        describe("Validations", async () => {
            it("Should reverse with the right error and fail if the call is not owner of token Id that will be updated", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice, owner } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await smartIntelligenceLicense.connect(addr1).adopt([true, true]);

                expect(await smartIntelligenceLicense.balanceOf(addr1.address)).to.equal(1);
                expect(await smartIntelligenceLicense.totalSupply())
                    .to.equal(1);

                await expect(smartIntelligenceLicense.connect(owner).setSILDetail([true, false], "1")).to.be.revertedWith("Only ownenr can access!")
            })

            it("Should reverse with the right error and fail if the setting was changed as you want already", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice, owner } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await smartIntelligenceLicense.connect(addr1).adopt([true, false]);

                expect(await smartIntelligenceLicense.balanceOf(addr1.address)).to.equal(1);
                expect(await smartIntelligenceLicense.totalSupply())
                    .to.equal(1);

                await expect(smartIntelligenceLicense.connect(addr1).setSILDetail([true, false], "1")).to.be.revertedWith("Changed as you want already!");
            })
        })

        describe("Update Setting", async () => {
            it("Should update into right setting info", async () => {
                const { smartIntelligenceLicense, paymentToken, addr1, mintPrice } = await loadFixture(deploySmartIntelligenceLicenseFixture);
                await paymentToken.transfer(addr1.address, mintPrice);
                await paymentToken.connect(addr1).approve(smartIntelligenceLicense.address, mintPrice);
                await smartIntelligenceLicense.connect(addr1).adopt([true, false]);

                expect(await smartIntelligenceLicense.balanceOf(addr1.address)).to.equal(1);
                expect(await smartIntelligenceLicense.totalSupply())
                    .to.equal(1);
                await smartIntelligenceLicense.connect(addr1).setSILDetail([true, true], "1");
                expect(await smartIntelligenceLicense.SILDetails(1)).to.equal([true, true])
            })
        })
    })

})


