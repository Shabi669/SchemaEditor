String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/{\d+}/g, function(match, index, offset, string) 
    {
            return args[parseInt(match.substr(1, match.length - 2))];
    });

}
String.prototype.camelCase = function ()
{
    var output = '';
    var toUpper = false;

    for (var i = 0; i < this.length; i++)
    {
        var ch = this.charAt(i);

        if (toUpper) ch = ch.toUpperCase();

        toUpper = false;

        if (ch == ' ')
            toUpper = true;
        else
            output = output + ch;   
    }

    return output;
}

export default {
    string: {
        camelCase: function (input) { return input.camelCase(); }
    }
}
