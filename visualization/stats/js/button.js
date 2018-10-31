function handleChange(input) {
    if (input.value < initTime) input.value = initTime;
    if (input.value > finalTime) input.value = finalTime;
}