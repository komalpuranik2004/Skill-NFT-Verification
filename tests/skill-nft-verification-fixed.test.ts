import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const teacher = accounts.get("wallet_1")!;
const student1 = accounts.get("wallet_2")!;
const student2 = accounts.get("wallet_3")!;
const nonTeacher = accounts.get("wallet_4")!;

describe("Skill NFT Verification Contract Tests", () => {
  it("should initialize correctly", () => {
    const { result } = simnet.callReadOnlyFn(
      "skill-nft-verification",
      "get-total-nfts",
      [],
      teacher
    );
    expect(result).toBeUint(0);
  });

  it("should allow teacher to mint NFT for student", () => {
    const { result } = simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      teacher
    );
    expect(result).toBeOk();
    expect(result).toBeSome();
  });

  it("should prevent non-teacher from minting NFT", () => {
    const { result } = simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      nonTeacher
    );
    expect(result).toBeErr();
  });

  it("should verify student has NFT after minting", () => {
    // First mint an NFT
    simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      teacher
    );

    // Then verify
    const { result } = simnet.callReadOnlyFn(
      "skill-nft-verification",
      "verify-skill",
      [student1],
      teacher
    );
    expect(result).toBeOk();
    expect(result).toBeSome();
  });

  it("should prevent duplicate NFT minting for same student", () => {
    // First mint should succeed
    simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      teacher
    );

    // Second mint should fail
    const { result } = simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      teacher
    );
    expect(result).toBeErr();
  });

  it("should track total NFTs correctly", () => {
    const initialCount = simnet.callReadOnlyFn(
      "skill-nft-verification",
      "get-total-nfts",
      [],
      teacher
    );

    simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student1],
      teacher
    );

    const finalCount = simnet.callReadOnlyFn(
      "skill-nft-verification",
      "get-total-nfts",
      [],
      teacher
    );

    expect(finalCount.result).toBeUint(initialCount.result + 1);
  });

  it("should return correct NFT owner", () => {
    const { result } = simnet.callPublicFn(
      "skill-nft-verification",
      "mint-skill-nft",
      [student2],
      teacher
    );

    const tokenId = result.expectSome().expectTuple()["token-id"];
    
    const { result: ownerResult } = simnet.callReadOnlyFn(
      "skill-nft-verification",
      "get-nft-owner",
      [tokenId],
      teacher
    );

    expect(ownerResult).toBeSome();
    expect(ownerResult).toBeEqual(student2);
  });
});
