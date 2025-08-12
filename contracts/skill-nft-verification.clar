;; Skill NFT Verification Contract
;; Mint NFT when teacher signs off

;; Define NFT
(define-non-fungible-token skill-nft uint)

;; Constants
(define-constant teacher 'STS44256CMB87WYHA9YPJJ11MFEKFH456S21S21B) ;; Fixed: Added single quotes for principal
(define-constant err-not-teacher (err u100))
(define-constant err-already-owned (err u101))

;; Data to track NFT IDs
(define-data-var last-token-id uint u0)

;; Map to track which student owns which NFT
(define-map student-nft-ids principal uint)

;; Function 1: Mint NFT when teacher signs off
(define-public (mint-skill-nft (student principal))
  (begin
    ;; Only teacher can mint
    (asserts! (is-eq tx-sender teacher) err-not-teacher)
    ;; Check if student already has an NFT
    (asserts! (is-none (map-get? student-nft-ids student)) err-already-owned)
    ;; Increment token ID
    (var-set last-token-id (+ (var-get last-token-id) u1))
    (let ((new-id (var-get last-token-id)))
      ;; Mint NFT to student
      (try! (nft-mint? skill-nft new-id student))
      ;; Track the NFT ID for this student
      (map-set student-nft-ids student new-id)
      (ok {token-id: new-id, owner: student})
    )
  )
)

;; Function 2: Check if a student owns any NFT and get the token ID
(define-read-only (verify-skill (student principal))
  (let ((nft-id (map-get? student-nft-ids student)))
    (if (is-some nft-id)
      (ok {has-nft: true, token-id: (unwrap-panic nft-id)})
      (ok {has-nft: false, token-id: u0})
    )
  )
)

;; Function 3: Get NFT owner by token ID
(define-read-only (get-nft-owner (token-id uint))
  (ok (nft-get-owner? skill-nft token-id))
)

;; Function 4: Get total number of NFTs minted
(define-read-only (get-total-nfts)
  (ok (var-get last-token-id))
)
