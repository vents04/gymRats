function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
function partition(arr, low, high, pivot) {
    let i = (low - 1);
 
    for (let j = low; j <= high - 1; j++) {
        if(arr[j].usedTimes > pivot.usedTimes) {
            i++;
            swap(arr, i, j);
        }else if (arr[j].usedTimes == pivot.usedTimes) {
            if (arr[j].timesFound > pivot.timesFound) {
                i++;
                swap(arr, i, j);
            }else if(arr[j].timesFound == pivot.timesFound){
                if (arr[j].keywords.length < pivot.keywords.length) {
                    i++;
                    swap(arr, i, j);
                }
            }
        }
    }
    swap(arr, i + 1, high);
    return (i + 1);
}
function quicksort(arr, low, high) {
    if (low < high) {
        let pivot = arr[high];

        let pi = partition(arr, low, high, pivot);
        quicksort(arr, low, pi - 1);
        quicksort(arr, pi + 1, high);
    }
}

module.exports = { quicksort }