export function getProfit(settings, network, category) {

    network = String(network).toUpperCase();
    category = String(category).toUpperCase();

    if (network === "MTN" && category === "SME")
        return Number(settings.mtnSmeProfit || 0);

    if (network === "MTN" && category === "AWOOF")
        return Number(settings.mtnAwoofProfit || 0);

    if (network === "MTN" && category === "DIRECT")
        return Number(settings.mtnDirectProfit || 0);

    if (network === "AIRTEL" && category === "AWOOF")
        return Number(settings.airtelAwoofProfit || 0);

    if (network === "AIRTEL" && category === "DIRECT")
        return Number(settings.airtelDirectProfit || 0);

    if (network === "GLO" && category === "SME")
        return Number(settings.gloSmeProfit || 0);

    if (network === "GLO" && category === "AWOOF")
        return Number(settings.gloAwoofProfit || 0);

    if (network === "GLO" && category === "DIRECT")
        return Number(settings.gloDirectProfit || 0);

    if (network === "9MOBILE" && category === "SME")
        return Number(settings.nineMobileSmeProfit || 0);

    if (network === "9MOBILE" && category === "AWOOF")
        return Number(settings.nineMobileAwoofProfit || 0);

    if (network === "9MOBILE" && category === "DIRECT")
        return Number(settings.nineMobileDirectProfit || 0);

    return 0;
        }
