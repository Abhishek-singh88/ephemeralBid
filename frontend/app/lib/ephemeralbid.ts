import type { Idl } from '@coral-xyz/anchor';

export type Ephemeralbid = typeof IDL;

export const IDL =
{
  "address": "HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE",
  "metadata": {
    "name": "ephemeralbid",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim_refund",
      "discriminator": [
        15,
        16,
        30,
        161,
        255,
        228,
        97,
        60
      ],
      "accounts": [
        {
          "name": "auction_house"
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "claim_seller_proceeds",
      "discriminator": [
        118,
        14,
        102,
        210,
        141,
        123,
        88,
        23
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "auction_house.auction_id",
                "account": "AuctionHouse"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "auction_house"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "close_sealed_bid",
      "discriminator": [
        225,
        18,
        243,
        66,
        94,
        161,
        43,
        127
      ],
      "accounts": [
        {
          "name": "auction_house"
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "commit_bid",
      "discriminator": [
        149,
        237,
        198,
        113,
        53,
        66,
        70,
        76
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        },
        {
          "name": "magic_program",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magic_context",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "commit_bid_l1",
      "discriminator": [
        199,
        121,
        188,
        7,
        79,
        141,
        176,
        244
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "create_auction",
      "discriminator": [
        234,
        6,
        201,
        246,
        47,
        219,
        176,
        107
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "auction_id"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "auction_id",
          "type": "u64"
        },
        {
          "name": "min_bid",
          "type": "u64"
        },
        {
          "name": "min_increment",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "delegate_bid",
      "discriminator": [
        205,
        246,
        97,
        168,
        93,
        183,
        203,
        117
      ],
      "accounts": [
        {
          "name": "buffer_sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "sealed_bid"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                242,
                96,
                133,
                63,
                142,
                184,
                10,
                176,
                73,
                157,
                225,
                152,
                140,
                130,
                123,
                23,
                164,
                195,
                182,
                163,
                62,
                16,
                255,
                172,
                208,
                102,
                49,
                235,
                221,
                52,
                15,
                247
              ]
            }
          }
        },
        {
          "name": "delegation_record_sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "sealed_bid"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegation_program"
            }
          }
        },
        {
          "name": "delegation_metadata_sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "sealed_bid"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegation_program"
            }
          }
        },
        {
          "name": "sealed_bid",
          "writable": true
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        },
        {
          "name": "owner_program",
          "address": "HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE"
        },
        {
          "name": "delegation_program",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "finalize_auction",
      "discriminator": [
        220,
        209,
        175,
        193,
        57,
        132,
        241,
        168
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "auction_house.auction_id",
                "account": "AuctionHouse"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "auction_house"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initialize_sealed_bid",
      "discriminator": [
        195,
        245,
        146,
        115,
        0,
        245,
        36,
        107
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "process_undelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "base_account",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "system_program"
        }
      ],
      "args": [
        {
          "name": "account_seeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "settle_committed_bid",
      "discriminator": [
        82,
        167,
        20,
        42,
        105,
        133,
        247,
        33
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true
        },
        {
          "name": "sealed_bid",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "submit_sealed_bid",
      "discriminator": [
        8,
        44,
        54,
        67,
        60,
        62,
        229,
        117
      ],
      "accounts": [
        {
          "name": "auction_house",
          "writable": true
        },
        {
          "name": "sealed_bid",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction_house"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true,
          "relations": [
            "sealed_bid"
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "AuctionHouse",
      "discriminator": [
        40,
        108,
        215,
        107,
        213,
        85,
        245,
        48
      ]
    },
    {
      "name": "SealedBid",
      "discriminator": [
        199,
        9,
        212,
        151,
        48,
        136,
        163,
        226
      ]
    }
  ],
  "events": [
    {
      "name": "AuctionCreated",
      "discriminator": [
        133,
        190,
        194,
        65,
        172,
        0,
        70,
        178
      ]
    },
    {
      "name": "AuctionFinalized",
      "discriminator": [
        136,
        160,
        117,
        237,
        77,
        211,
        136,
        28
      ]
    },
    {
      "name": "BidCommitted",
      "discriminator": [
        81,
        13,
        193,
        139,
        0,
        168,
        82,
        55
      ]
    },
    {
      "name": "BidSettled",
      "discriminator": [
        234,
        32,
        141,
        114,
        0,
        102,
        0,
        139
      ]
    },
    {
      "name": "BidSubmitted",
      "discriminator": [
        116,
        72,
        108,
        240,
        175,
        70,
        56,
        22
      ]
    },
    {
      "name": "RefundClaimed",
      "discriminator": [
        136,
        64,
        242,
        99,
        4,
        244,
        208,
        130
      ]
    },
    {
      "name": "SellerProceedsClaimed",
      "discriminator": [
        40,
        165,
        152,
        185,
        201,
        108,
        110,
        60
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AuctionActive",
      "msg": "Auction is still active"
    },
    {
      "code": 6001,
      "name": "AuctionEnded",
      "msg": "Auction has ended"
    },
    {
      "code": 6002,
      "name": "AuctionFinalized",
      "msg": "Auction already finalized"
    },
    {
      "code": 6003,
      "name": "AuctionNotFinalized",
      "msg": "Auction not finalized"
    },
    {
      "code": 6004,
      "name": "BidIncrementTooSmall",
      "msg": "Bid increment is too small"
    },
    {
      "code": 6005,
      "name": "BidBelowMinimum",
      "msg": "Bid is below auction minimum"
    },
    {
      "code": 6006,
      "name": "CannotDelegate",
      "msg": "Cannot delegate this account in its current state"
    },
    {
      "code": 6007,
      "name": "AccountNotDelegated",
      "msg": "Bid account is not delegated"
    },
    {
      "code": 6008,
      "name": "BidNotCommitted",
      "msg": "Bid account is not committed"
    },
    {
      "code": 6009,
      "name": "BidAlreadySettled",
      "msg": "Bid account has already been settled"
    },
    {
      "code": 6010,
      "name": "UnsettledCommittedBids",
      "msg": "There are unsettled committed bids"
    },
    {
      "code": 6011,
      "name": "BidAuctionMismatch",
      "msg": "Bid account is linked to a different auction"
    },
    {
      "code": 6012,
      "name": "InvalidDuration",
      "msg": "Duration must be greater than zero"
    },
    {
      "code": 6013,
      "name": "InvalidMinBid",
      "msg": "Minimum bid must be greater than zero"
    },
    {
      "code": 6014,
      "name": "MathOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6015,
      "name": "ProceedsAlreadyClaimed",
      "msg": "Seller proceeds have already been claimed"
    },
    {
      "code": 6016,
      "name": "NoWinningBid",
      "msg": "No winning bid in this auction"
    },
    {
      "code": 6017,
      "name": "WinnerNoRefund",
      "msg": "Winner cannot claim refund"
    },
    {
      "code": 6018,
      "name": "RefundAlreadyClaimed",
      "msg": "Refund already claimed"
    },
    {
      "code": 6019,
      "name": "NoRefundAvailable",
      "msg": "No refundable amount available"
    },
    {
      "code": 6020,
      "name": "InsufficientVaultBalance",
      "msg": "Vault balance is insufficient"
    },
    {
      "code": 6021,
      "name": "CloseNotAllowed",
      "msg": "Bid account cannot be closed yet"
    }
  ],
  "types": [
    {
      "name": "AuctionCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "auction_id",
            "type": "u64"
          },
          {
            "name": "min_bid",
            "type": "u64"
          },
          {
            "name": "min_increment",
            "type": "u64"
          },
          {
            "name": "ends_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "AuctionFinalized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "final_bid",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "AuctionHouse",
      "docs": [
        "Global auction state for one auction instance."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "auction_id",
            "type": "u64"
          },
          {
            "name": "min_bid",
            "type": "u64"
          },
          {
            "name": "min_increment",
            "type": "u64"
          },
          {
            "name": "highest_bid",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "bidder_count",
            "type": "u32"
          },
          {
            "name": "committed_count",
            "type": "u32"
          },
          {
            "name": "settled_count",
            "type": "u32"
          },
          {
            "name": "finalized",
            "type": "bool"
          },
          {
            "name": "proceeds_claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vault_bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "BidCommitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "BidSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "current_highest_bid",
            "type": "u64"
          },
          {
            "name": "current_winner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "BidStatus",
      "docs": [
        "Lifecycle of an individual bidder's private bid account."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Ready"
          },
          {
            "name": "Active"
          },
          {
            "name": "Committed"
          }
        ]
      }
    },
    {
      "name": "BidSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RefundClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "SealedBid",
      "docs": [
        "Bidder-specific sealed bid state. Delegated/committed via ER/PER flow."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deposited",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "BidStatus"
              }
            }
          },
          {
            "name": "committed",
            "type": "bool"
          },
          {
            "name": "settled",
            "type": "bool"
          },
          {
            "name": "refund_claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SellerProceedsClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
} as const satisfies Idl;
