import React, { useEffect, useState } from "react";
import NFTMinter from "./NFTMinter";

const Connect2Phantom = () => {
    const [walletAvail, setWalletAvail] = useState(false);
    const [provider, setProvider] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if ("solana" in window) {
            const solWindow = window;
            if (solWindow.solana && solWindow.solana.isPhantom) {
                setProvider(solWindow.solana);
                setWalletAvail(true);
                solWindow.solana.connect({ onlyIfTrusted: true });
            }
        }
    }, []);

    useEffect(() => {
        provider?.on("connect", (publicKey) => {
            setConnected(true);
        });
        provider?.on("disconnect", () => {
            console.log("disconnect event");
            setConnected(false);
        });
    }, [provider]);

    const connectHandler = (event) => {
        console.log(`connect handler`);
        provider?.connect()
            .catch((err) => {
                console.error("connect ERROR:", err);
            });
    

    };

    const disconnectHandler = (event) => {
        console.log("disconnect handler");
        provider?.disconnect()
            .catch((err) => {
                console.error("disconnect ERROR:", err);
            });
    };

    return (
        <div className="container mx-auto mt-8 flex justify-center">
            {walletAvail ? (
                <>
                    {!connected ? (
                        <button
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto`}
                            disabled={connected}
                            onClick={connectHandler}
                        >
                            Connect to Phantom
                        </button>
                    ) : (
                        <>
                            <div className="flex flex-col items-center">
                                <button
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto`}
                                    disabled={!connected}
                                    onClick={disconnectHandler}
                                >
                                    Disconnect from Phantom
                                </button>
                                <br />
                                <NFTMinter web3={provider}  />
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <p>
                        Opps!!! Phantom is not available. Go get it{" "}
                        <a href="https://phantom.app/">https://phantom.app/</a>.
                    </p>
                </>
            )}
        </div>
    );
};

export default Connect2Phantom;
